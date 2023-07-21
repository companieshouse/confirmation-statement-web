# Configure the remote state data source to acquire configuration
# created through the code in ch-service-terraform/aws-mm-networks.
data "terraform_remote_state" "networks" {
  backend = "s3"
  config = {
    bucket = var.remote_state_bucket
    key    = "${var.state_prefix}/${var.deploy_to}/${var.deploy_to}.tfstate"
    region = var.aws_region
  }
}

data "aws_ecs_cluster" "ecs-cluster" {
  cluster_name = "${local.name_prefix}-cluster"
}
data "aws_iam_role" "ecs-cluster-iam-role" {
  name = "${local.name_prefix}-ecs-task-execution-role"
}

data "aws_lb" "filing-maintain-lb" {
  name = "filing-maintain-${var.environment}-lb"
}
data "aws_lb_listener" "filing-maintain-lb-listener" {
  load_balancer_arn = data.aws_lb.filing-maintain-lb.arn
  port = 443
}

# retrieve all secrets for this stack using the stack path
data "aws_ssm_parameters_by_path" "secrets" {
  path = "/${local.name_prefix}"
}
# create a list of secrets names to retrieve them in a nicer format and lookup each secret by name
data "aws_ssm_parameter" "secret" {
  for_each = toset(data.aws_ssm_parameters_by_path.secrets.names)
  name = each.key
}
