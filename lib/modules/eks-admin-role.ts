import {
  AccountPrincipal,
  ManagedPolicy,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

/**
 *
 * @param scope Scope of the construct
 * @param account AWS account id
 * @param clusterAdminRoleName Name of the role defined in the stack main class
 * @param namePrefix Prefixt to set id's and name resources
 * @returns Role
 */
export const createEksAdminRole = (
  scope: Construct,
  account: string,
  clusterAdminRoleName: string,
  namePrefix: string
) => {
  return new Role(scope, clusterAdminRoleName, {
    assumedBy: new AccountPrincipal(account),
    roleName: clusterAdminRoleName,
    managedPolicies: [
      createEksAdminPolicy(scope, `${namePrefix}EK8SAdminPolicy`),
    ],
  });
};

const createEksAdminPolicy = (scope: Construct, eksPolicyName: string) => {
  return new ManagedPolicy(scope, eksPolicyName, {
    managedPolicyName: eksPolicyName,
    statements: [
      new PolicyStatement({
        actions: ["eks:AccessKubernetesApi", "eks:Describe*", "eks:List*"],
        resources: ["*"],
      }),
    ],
  });
};
