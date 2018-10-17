#! /bin/bash

JSYMBURL=https://sourceforge.net/projects/jmir/files/jSymbolic/jSymbolic%202.2/jSymbolic_2_2_user.zip

wget $JSYMBURL -P thirdparty
unzip thirdparty/jSymbolic_2_2_user.zip -d thirdparty/
rm thirdparty/jSymbolic_2_2_user.zip
printf "\nalias jsymb='java -Xmx6g -jar /app/thirdparty/jSymbolic_2_2_user/jSymbolic2.jar'\n" >> ~/.bashrc

