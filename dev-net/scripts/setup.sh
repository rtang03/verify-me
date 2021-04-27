#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

export RELEASE=0.0.1
export CONFIG=./config
export VOLUME=./volume
export SCRIPTS=./scripts
export CURRENT_DIR=`pwd`
export ROOT_DIR=$CURRENT_DIR/..

export LOG_LEVEL=info
export LOG_TARGET=console

# $1 - message to be printed
# $2 - exit code of the previous operation
printMessage() {
  if [ $2 -ne 0 ] ; then
    printf "${RED}${1} failed${NC}\n"
    exit $2
  fi
  printf "${GREEN}Complete ${1}${NC}\n\n"
  sleep 1
}

# $1 - container name
# $2 - expected | command if 3 arguments
# $3 - optional: expected
containerWait() {
  FOUND=false
  COUNT=120
  while [[ ("$FOUND"=false) && (COUNT -gt 0) ]]; do
    if [ $# -eq 3 ]; then
      RESULT=`docker container exec -i $1 "$2" | grep -e "$3"`
    else
      RESULT=`docker logs $1 2>&1 | grep -e "$2"`
    fi
    echo -n "."
    if [ ! -z "$RESULT" ]; then
      FOUND=true
      printf "${GREEN}container ${1} ready${NC}\n"
      break
    fi
    COUNT=$(( COUNT - 1 ))
    sleep 1
  done
  if [ $COUNT -le 0 ]; then
    printf "${RED}waiting for container $1 timed out${NC}\n"
    exit 1
  fi
}

# $1 - script name
# $2 - options
parseArgs() {
  OPTION=-d  # default cleanup operation (?)
  COMPOSE=0  # run docker-compose only, skip bootstrap
  TESTONLY=0 # run docker-compose for tester only
  CLEANUP=1  # run cleaup after tester finish
  if [ $# -eq 2 ]; then
    case $2 in
      -h|--help)
        echo "Usage: $1 {-R | --remove-cc-images | -h | --help}"
        exit 0
        ;;
      -R|--remove-cc-images)
        OPTION=$2
        ;;
      -C|--compose-only)
        COMPOSE=1
        ;;
      -T|--test-only)
        COMPOSE=1
        TESTONLY=1
        ;;
      -U|--no-cleanup)
        CLEANUP=0
        ;;
    esac
  fi
}
