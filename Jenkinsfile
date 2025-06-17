pipeline {
    agent any

    environment {
        IMAGE_NAME = 'app-react'
        IMAGE_TAG = 'latest'
        CONTAINER_NAME = 'app-react-container'
        APP_PORT = '3000'
    }

    stages {
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
                withCredentials([usernamePassword(credentialsId: 'DockerHubCredentials', usernameVariable: 'dockerUser', passwordVariable: 'dockerPassword')]) {
                    sh 'docker login -u $dockerUser -p $dockerPassword'
                }
                echo 'Docker login successful.'
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
                    if (sh(script: 'command -v cloudflared', returnStatus: true) != 0) {
                        error('cloudflared is not installed.')
                    }
                }
                sh '''
                    nohup cloudflared tunnel --url http://localhost:$APP_PORT > cloudflared.log 2>&1 &
                    sleep 15
                    echo "Cloudflare Tunnel Public URL:"
                    grep -o 'https://.*trycloudflare.com' cloudflared.log || echo "Cannot find URL"
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleanup: Removing container, image, and tunnel if exist...'
            sh '''
                docker rm -f $CONTAINER_NAME || true
                docker rmi -f $IMAGE_NAME:$IMAGE_TAG || true
                pkill -f cloudflared || true
            '''
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Stopping container if running...'
            sh '''
                if docker ps -q -f name=${CONTAINER_NAME}; then
                    docker stop ${CONTAINER_NAME}
                fi
            '''        
        }
    }
}
