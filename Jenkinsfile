// Run docker with: docker run --name jenkins-docker -u root -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock -v <YOUR_HOME>:/var/jenkins_home jenkins/jenkins
// In my case, YOUR_HOME is ~/jenkinDir

pipeline {
    agent any

    environment {
        IMAGE_NAME = 'app-react'
        IMAGE_TAG = 'latest'
        SELENIUM_IMAGE = 'selenium/standalone-chrome'
        CONTAINER_NAME = 'app-react-container'
        CLOUDFLARE_TUNNEL_NAME = 'app-react-tunnel'
        APP_PORT = '3000'
    }

    stages {
        stage('Code Checkout') {
            steps {
                git branch: 'bao', url: 'https://github.com/THHuy/appreact.git'
            }
        }

        stage('Initialize Docker') {
            steps {
                echo 'Checking Docker installation...'
                script {
                    def dockerExists = sh(script: 'command -v docker', returnStatus: true) == 0
                    if (!dockerExists) {
                        echo 'Docker CLI not found. Installing...'
                        sh '''
                            apt-get update
                            apt-get install -y ca-certificates curl gnupg lsb-release
                            mkdir -p /etc/apt/keyrings
                            curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                            echo \
                              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
                              $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                            apt-get update
                            apt-get install -y docker-ce docker-ce-cli containerd.io
                        '''
                    } else {
                        echo 'Docker is already installed.'
                    }
                }

                echo 'Removing old Docker containers...'
                sh """
                    docker rm -f $CONTAINER_NAME || true
                    docker rm -f $CLOUDFLARE_TUNNEL_NAME || true
                """
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
                //sh 'npm test -- --coverage'
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
                    sleep 5
                    echo 'Cloudflare Tunnel Public URL:'
                    sh '''
                        CLOUDFLARE_TUNNEL_URL=$(docker logs $CLOUDFLARE_TUNNEL_NAME 2>&1 | grep -o 'https://.*trycloudflare.com' | head -n 1)
                        echo "$CLOUDFLARE_TUNNEL_URL" > tunnel_url.txt
                    '''
                }
            }
        }
        stage('UAT with Selenium') {
            steps {
                echo 'Running Python Selenium tests using Chrome in headless mode'
                script {
                    sh """
                        docker run --rm --network host \
                            -v "\$(pwd)/src/test:/tests" \
                            -v "\$(pwd)/src/test/data:/tests/data" \
                            $SELENIUM_IMAGE \
                            sh -c '
                                apt-get update && apt-get install -y python3 python3-pip &&
                                pip3 install selenium &&
                                python3 /tests/runTest.py $CLOUDFLARE_TUNNEL_URL
                            '
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
