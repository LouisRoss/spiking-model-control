FROM    node:latest
LABEL   maintainer="Louis Ross <louis.ross@gmail.com"

ARG     MYDIR=/home/spiking-model-control

COPY    install-deps ${MYDIR}/

RUN     echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN     bash ${MYDIR}/install-deps ${MYDIR} >>install-deps.log

COPY ["./spiking-model-control/*", "./spiking-model-control/"]

CMD     ["bash"]
