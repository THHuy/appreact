pipeline {
    agent any

    environment {
        IMAGE_NAME = 'app-react'
        IMAGE_TAG = 'latest'
        CONTAINER_NAME = 'app-react-container'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'master', url: 'https://github.com/THHuy/appreact.git'
                sh '''
                    echo "Install docker cli"
                    if ! command -v docker >/dev/null 2>&1; then
                        echo "Docker CLI not found! Install Docker."
                        curl -fsSL https://get.docker.com -o get-docker.sh
                        sh get-docker.sh
                        rm get-docker.sh
                        echo "Docker CLI installed successfully."
                    else
                        echo "Docker CLI is already installed."
                    fi
                '''
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
            }
        }

        stage('Unit Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm test -- --coverage'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DockerHubCredentials', usernameVariable: 'dockerUser', passwordVariable: 'dockerPassword')]) {
                    sh 'docker login -u $dockerUser -p $dockerPassword'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                    docker rm -f $CONTAINER_NAME 2>/dev/null || true
                    docker run -d --name $CONTAINER_NAME -p 3000:3000 $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }

        stage('Cloudflare Tunnel') {
            steps {
                sh '''
                    if ! command -v cloudflared >/dev/null 2>&1; then
                        echo "cloudflared not installed!"
                        exit 1
                    fi
                    nohup cloudflared tunnel --url http://localhost:3000 > cloudflared.log 2>&1 &
                    sleep 15
                    echo "🔗 Cloudflare Tunnel Public URL:"
                    grep -o 'https://.*trycloudflare.com' cloudflared.log || echo "❌ Cannot find URL"
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleanup: Removing container, image, and tunnel if exist...'
            sh '''
                docker rm -f $CONTAINER_NAME 2>/dev/null || true
                docker rmi -f $IMAGE_NAME:$IMAGE_TAG 2>/dev/null || true
                pkill -f cloudflared || true
            '''
        }
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}