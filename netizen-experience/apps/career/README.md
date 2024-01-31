# Career API development

## Pre-requisites

Install SAM following the guide: [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Local development

This project uses LocalStack to simulate AWS environment in your machine.

First, find out the docker endpoint of your machine using [`docker context ls` command](https://docs.docker.com/engine/context/working-with-contexts/). If you are using Docker's desktop client, use the endpoint of `desktop-linux`.

```bash
docker context ls
```

Exmaple output:

```console
NAME            DESCRIPTION                               DOCKER ENDPOINT                                  ...
default *       Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                      ...
desktop-linux   Docker Desktop                            unix:///home/<user>/.docker/desktop/docker.sock  ...
```

Create a new file named `.env` in the root directory of `career/server`.
Add the following variables into it, and replace `{YOUR_DOCKER_ENDPOINT}` with your docker endpoint:

```env
DOCKER_HOST={YOUR_DOCKER_ENDPOINT} # example: unix:///home/<user>/.docker/desktop/docker.sock
```

Next, create another new file named `.env` in the root directory of `career/api`.
Add the following variables into it, and replace `{YOUR_DOCKER_ENDPOINT}` with your docker endpoint:

```env
DOCKER_HOST={YOUR_DOCKER_ENDPOINT} # example: unix:///home/<user>/.docker/desktop/docker.sock
LOCALSTACK_ENDPOINT=http://localhost.localstack.cloud:4566
```

To test the API locally run the following command:

```bash
npx nx run-many -t dev -p career-server career-api
```
