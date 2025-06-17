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
                git branch: 'master',
                    url: 'https://github.com/THHuy/appreact.git'
            }
        }

        stage("Install Dependencies") {
            steps {
                sh "npm ci"
            }
        }

        stage("Unit Test") {
            steps {
                sh "npm test -- --coverage"
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DockerHubCredentials', usernameVariable: 'dockerUser', passwordVariable: 'dockerPassword')]) {
                    sh 'docker login -u ${dockerUser} -p ${dockerPassword}'
                }
            }
        }

        stage("Build image") {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage("Docker run local") {
            steps {
                sh "docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage("Ngrok") {
            steps {
                withCredentials([string(credentialsId: 'NgrokToken', variable: 'NGROK_AUTHTOKEN')]) {
                    // sh '''
                    //     ngrok config add-authtoken $NGROK_AUTHTOKEN
                    //     nohup ngrok http 3000 > ngrok.log 2>&1 &
                    // '''
                    sh '''
                        ngrok config add-authtoken $NGROK_AUTHTOKEN
                        nohup ngrok http 3000 > ngrok.log 2>&1 &
                        sleep 5  # đợi ngrok khởi động
                        echo "🔗 Ngrok Public URL:"
                        curl -s http://localhost:4040/api/tunnels \
                            | grep -o '"public_url":"https:[^"]*' \
                            | cut -d '"' -f4
                    '''

                }
            }
        }
    }

    post {
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

        always {
            echo '🧹 Cleanup: Removing image and container if exist.'
            sh '''
                if docker ps -a -q -f name=${CONTAINER_NAME}; then
                    docker rm -f ${CONTAINER_NAME}
                fi
                if docker images -q ${IMAGE_NAME}:${IMAGE_TAG}; then
                    docker rmi -f ${IMAGE_NAME}:${IMAGE_TAG}
                fi
            '''
        }
    }
}