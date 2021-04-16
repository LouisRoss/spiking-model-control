FROM    node:latest
LABEL   maintainer="Louis Ross <louis.ross@gmail.com"

ARG     MYDIR=/home/spiking-model-client
WORKDIR ${MYDIR}

COPY    install-deps ${MYDIR}/

RUN     echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN     bash ${MYDIR}/install-deps ${MYDIR} >>install-deps.log
CMD     ["bash"]
