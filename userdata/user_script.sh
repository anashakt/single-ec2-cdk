#! /bin/bash -x
# Copyright [first edit year]-[latest edit year] Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
# except in compliance with the License. A copy of the License is located at
#
#     http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under the License.

# install critial tools
sudo yum -y update
sudo yum remove -y awscli # remove v1 to make way to install v2
sudo yum -y install expect jq curl git
# install AWS CLI
wget "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -O "awscliv2.zip"
unzip -o awscliv2.zip
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
rm -Rf aws awscliv2.zip
# install SAM
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip -O sam.zip
unzip sam.zip -o -d sam-installation
sudo ./sam-installation/install
sam --version
rm -Rf ./sam-installation sam.zip
# install NVM
export HOME=/usr/local/bin
cd /usr/local/bin || exit
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
cat << "EOF" >> /etc/profile
NVM_DIR=/usr/local/bin/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
eval `ssh-agent -s`
for i in $HOME/.ssh/*.pem;
do
    [ -f "$i" ] || break
    ssh-add $i
done
EOF

export HOME=/root
cat << "EOF" >> $HOME/.bashrc
source /etc/profile
source $NVM_DIR/nvm.sh
EOF
source $HOME/.bashrc

nvm install 16
nvm use 16
npm install -g npm nodejs typescript aws-sdk aws-cdk yarn

# set local variables
INSTANCE_ID=$(wget -qO- http://instance-data/latest/meta-data/instance-id)
HOST=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=nickName" | jq -r .Tags[].Value)
DOMAIN=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=domainName" | jq -r .Tags[].Value)
echo "preserve_hostname: true" >> /etc/cloud/cloud.cfg
hostnamectl set-hostname $HOST.$DOMAIN
echo "ssh-add $KEYFILE" >> /etc/profile
# configure DNS
touch /var/lib/cloud/scripts/per-boot/set-dns
chmod +x /var/lib/cloud/scripts/per-boot/set-dns
cat << "EOF" > /var/lib/cloud/scripts/per-boot/set-dns
#!/bin/bash
INSTANCE_ID=$(wget -qO- http://instance-data/latest/meta-data/instance-id)
MY_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4/)
DOMAIN=`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=domainName" | jq -r .Tags[].Value`
HOST=`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=nickName" | jq -r .Tags[].Value`
FQDN=$HOST.$DOMAIN
/usr/local/bin/aws route53 change-resource-record-sets --hosted-zone-id
 --change-batch '{
    "Changes":[{
        "Action":"UPSERT",
        "ResourceRecordSet":{
            "Name": "'$FQDN'",
            "Type":"A",
            "TTL":10,
            "ResourceRecords":[
                {
                    "Value": "'$MY_IP'"
                }
            ]
        }
        }]
}'
EOF
var/lib/cloud/scripts/per-boot/set-dns

# to inspect what this script did, inspect /var/log/cloud-init-output.log
