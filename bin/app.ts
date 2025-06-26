#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BancDemoEKSDeployment } from "../lib/main";

const app = new cdk.App();
new BancDemoEKSDeployment(app, "DemoOlympusDeployment", {
  env: { account: "171057908863", region: "us-west-2" },
  environment: "dev",
  adminPasswordSecretName: "internal-k8s-argocd-password",
  credentialsSecretName: "internal-k8s-argocd-repository-credentials",
  repositoryUrl: "https://github.com/b365tech/k8s-workloads.git",
  applicationPath: "pci/envs/dev",
  clusterName: "demo-olympus",
  meshId: "demo.banc365.com",
  network: "olympus",
  vpcId: "vpc-000518f2db3073fe9",
});

new BancDemoEKSDeployment(app, "DemoPCIDeployment", {
  env: { account: "171057908863", region: "us-west-2" },
  environment: "dev",
  adminPasswordSecretName: "internal-k8s-argocd-password",
  credentialsSecretName: "internal-k8s-argocd-repository-credentials",
  repositoryUrl: "https://github.com/b365tech/k8s-workloads.git",
  applicationPath: "pci/envs/dev",
  clusterName: "demo-pci",
  meshId: "demo.banc365.com",
  network: "pci",
  vpcId: "vpc-081892aa3471307c3",
});
