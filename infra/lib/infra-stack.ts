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
      description: 'Allow SSH and HTTP access',
      allowAllOutbound: true,
    });

    // Allow SSH from company IPs
    companyIpv4.forEach(ip => {
      securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(22), 'Allow SSH from company IPs');
    });

    // Allow HTTP access from anywhere
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow HTTP on port 3000');

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
      'service docker start',
      `usermod -a -G docker ${ec2User}`,
      `docker run -d -p 3000:3000 ${ecrRepo.repositoryUri}:latest`
    );

    instance.role.addToPrincipalPolicy(new PolicyStatement({
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
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

  }
}
