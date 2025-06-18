// Run docker with: docker run --name jenkins-docker -u root -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock -v <YOUR_HOME>:/var/jenkins_home jenkins/jenkins
// In my case, YOUR_HOME is ~/jenkinDir

pipeline {
    agent any

    environment {
        IMAGE_NAME = 'app-react'
        IMAGE_TAG = 'latest'
        CONTAINER_NAME = 'app-react-container'
        CLOUDFLARE_TUNNEL_NAME = 'app-react-tunnel'
        APP_PORT = '3000'
    }

    stages {
        stage('Init') {
            steps {
                echo 'Cleanup: Removing old containers if any...'
                sh """
                    docker rm -f $CONTAINER_NAME || true
                    docker rm -f $CLOUDFLARE_TUNNEL_NAME || true
                """
            }
        }
        stage('Checkout Code') {
            steps {
                git branch: 'master', url: 'https://github.com/THHuy/appreact.git'
            }
        }

        stage('Install Dependencies & Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm test -- --coverage'
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    if (!sh(script: 'command -v docker', returnStatus: true) == 0) {
                        echo 'Docker CLI not found. Installing...'
                        sh '''
                            curl -fsSL https://get.docker.com -o get-docker.sh
                            sh get-docker.sh && rm get-docker.sh
                        '''
                    } else {
                        echo 'Docker is already installed.'
                    }
                }
                // Uncomment the following lines if want to use DockerHub credentials
                // withCredentials([usernamePassword(credentialsId: 'DockerHubCredentials', usernameVariable: 'dockerUser', passwordVariable: 'dockerPassword')]) {
                //     sh 'docker login -u $dockerUser -p $dockerPassword'
                // }
                // echo 'Docker login successful.'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
            }
        }

        stage('Run Docker Container') {
            steps {
                sh """
                    docker rm -f $CONTAINER_NAME || true
                    docker run -d --name $CONTAINER_NAME -p $APP_PORT:$APP_PORT $IMAGE_NAME:$IMAGE_TAG
                """
            }
        }
        stage('Cloudflare Tunnel') {
            steps {
                script {
                    echo 'Start Cloudflare Tunnel with Docker'
                    // Use host network if Jenkins is running outside Docker, otherwise map specific port
                    sh """
                        docker run -d --name $CLOUDFLARE_TUNNEL_NAME \
                            --network host \
                            cloudflare/cloudflared:latest \
                            tunnel --url http://localhost:$APP_PORT 
                    """
                    echo 'Waiting cloudflared to create tunnel...'
                    sleep 15
                    echo 'Cloudflare Tunnel Public URL:'
                    sh """
                        docker logs $CLOUDFLARE_TUNNEL_NAME 2>&1 | grep -o 'https://.*trycloudflare.com' || echo "Cannot find URL"
                    """
                }
            }
        }
    }

    post {
        success {
            sh """
                echo "Pipeline completed successfully."
                echo "Docker image $IMAGE_NAME:$IMAGE_TAG built and container $CONTAINER_NAME is running."
                echo "Cloudflare Tunnel is active."
            """
        }

        failure {
            echo 'Pipeline failed. Cleaning up container...'
            sh """
                docker rm -f $CONTAINER_NAME || true
                pkill -f cloudflared || true
            """
        }

        always {
            echo 'Cleanup: Clean image, workspace'
            sh """
                docker rmi -f $IMAGE_NAME:$IMAGE_TAG || true
            """
            cleanWs()
        }
    }
}
