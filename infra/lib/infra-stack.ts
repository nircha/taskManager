import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { companyIpv4 } from './company-ipv4';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'TaskManagerVpc', {
      maxAzs: 2, // Default is all AZs in region
    });

    // Create a security group
    const securityGroup = new ec2.SecurityGroup(this, 'TaskManagerSG', {
      vpc,
      description: 'Allow SSH, HTTP, and HTTPS access',
      allowAllOutbound: true,
    });

    // Allow SSH from company IPs
    companyIpv4.forEach(ip => {
      securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(22), 'Allow SSH from company IPs');
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');

    // Create an EC2 instance
    const instance = new ec2.Instance(this, 'TaskManagerInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'task-manager-key'),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Create ECR Repository
    const ecrRepo = new ecr.Repository(this, 'TaskManagerRepo', {
      repositoryName: 'task-manager',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete on cdk destroy
    });

    const ec2User= 'ec2-user';
    // Update user data to use the ECR image
    instance.addUserData(
      'yum update -y',
      'amazon-linux-extras install docker -y',
      'amazon-linux-extras install nginx1 -y',
      'yum install -y openssl',
      'service docker start',
      'systemctl enable docker',
      `usermod -a -G docker ${ec2User}`,
      'mkdir -p /etc/nginx/ssl',
      'openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/task-manager.key -out /etc/nginx/ssl/task-manager.crt -subj "/CN=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname || echo localhost)"',
      'cat <<\'EOF\' >/etc/nginx/conf.d/task-manager.conf\nserver {\n    listen 80;\n    server_name _;\n    return 301 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n    server_name _;\n\n    ssl_certificate /etc/nginx/ssl/task-manager.crt;\n    ssl_certificate_key /etc/nginx/ssl/task-manager.key;\n    ssl_protocols TLSv1.2 TLSv1.3;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto https;\n    }\n}\nEOF',
      'rm -f /etc/nginx/conf.d/default.conf',
      'systemctl enable nginx',
      'systemctl restart nginx',
      `docker run -d --restart unless-stopped -p 127.0.0.1:3000:3000 ${ecrRepo.repositoryUri}:latest`
    );

    instance.role.addToPrincipalPolicy(new PolicyStatement({
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:CreateLogGroup"
      ],
      resources: ["*"]
    }));

    // Output the ECR repository URI
      new cdk.CfnOutput(this, 'ECR_REGISTRY', {
        value: ecrRepo.repositoryUri.split('/')[0], // Registry part
      });
      new cdk.CfnOutput(this, 'ECR_REPOSITORY', {
        value: ecrRepo.repositoryName, // Repository name part
      });

    // Output the instance public IP
    new cdk.CfnOutput(this, 'EC2_HOST', {
      value: instance.instancePublicIp,
    });

    new cdk.CfnOutput(this, 'EC2_SG_ID', {
      value: securityGroup.securityGroupId,
    });

    new cdk.CfnOutput(this, 'EC2_USER', {
      value: ec2User,
    });

    new cdk.CfnOutput(this, 'InstancePublicDns', {
      value: instance.instancePublicDnsName,
      description: 'Public DNS name of the EC2 instance',
    });

    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: cdk.Fn.join('', ['https://', instance.instancePublicDnsName]),
      description: 'HTTPS endpoint for the task manager application',
    });

  }
}
