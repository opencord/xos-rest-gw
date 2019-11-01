# Copyright 2019-present Open Networking Foundation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Configure shell
SHELL = bash -e -o pipefail

# Variables
VERSION                  ?= $$(python -c 'import json,sys;obj=json.load(sys.stdin); print obj["version"]' < package.json)
CONTAINER_NAME           ?= $(notdir $(abspath .))

EMPTY :=
SPACE := $(EMPTY) $(EMPTY)
COMMA := $(EMPTY),$(EMPTY)

ARCH=$(subst aarch64,arm64,$(subst x86_64,amd64,$(patsubst i%86,386,$(shell uname -m))))
LINUX_ARCH := amd64 arm64
PLATFORMS := $(subst $(SPACE),$(COMMA),$(foreach arch,$(LINUX_ARCH),linux/$(arch)))

## Docker related
DOCKER_REGISTRY          ?=
DOCKER_REPOSITORY        ?=
DOCKER_BUILD_ARGS        ?=
DOCKER_TAG               ?= ${VERSION}
DOCKER_IMAGENAME         := ${DOCKER_REGISTRY}${DOCKER_REPOSITORY}${CONTAINER_NAME}:${DOCKER_TAG}
DOCKER_ARCH_IMAGENAME    := ${DOCKER_IMAGENAME}-${ARCH}

## Docker labels. Only set ref and commit date if committed
DOCKER_LABEL_VCS_URL     ?= $(shell git remote get-url $(shell git remote))
DOCKER_LABEL_VCS_REF     ?= $(shell git diff-index --quiet HEAD -- && git rev-parse HEAD || echo "unknown")
DOCKER_LABEL_COMMIT_DATE ?= $(shell git diff-index --quiet HEAD -- && git show -s --format=%cd --date=iso-strict HEAD || echo "unknown" )
DOCKER_LABEL_BUILD_DATE  ?= $(shell date -u "+%Y-%m-%dT%H:%M:%SZ")

## xosgenx related - paths are relative to this directory
XOS_DIR                  ?= "../xos"

all: test

docker-build:
	docker build $(DOCKER_BUILD_ARGS) \
    -t ${DOCKER_ARCH_IMAGENAME} \
    --build-arg org_label_schema_version="${VERSION}" \
    --build-arg org_label_schema_vcs_url="${DOCKER_LABEL_VCS_URL}" \
    --build-arg org_label_schema_vcs_ref="${DOCKER_LABEL_VCS_REF}" \
    --build-arg org_label_schema_build_date="${DOCKER_LABEL_BUILD_DATE}" \
    --build-arg org_opencord_vcs_commit_date="${DOCKER_LABEL_COMMIT_DATE}" \
    -f Dockerfile .
	docker tag ${DOCKER_ARCH_IMAGENAME} ${DOCKER_IMAGENAME}

docker-push:
	docker push ${DOCKER_ARCH_IMAGENAME}
ifeq ($(ARCH),amd64)
	docker push ${DOCKER_IMAGENAME}
endif

pre:
	wget https://github.com/estesp/manifest-tool/releases/download/v0.9.0/manifest-tool-linux-${ARCH} \
      -O manifest-tool && \
      chmod +x ./manifest-tool

push-manifest:
	./manifest-tool push from-args --platforms ${PLATFORMS} \
	  --template ${DOCKER_IMAGENAME}-ARCH \
	  --target ${DOCKER_IMAGENAME}

push-all: pre
	for arch in ${LINUX_ARCH}; do \
		$(MAKE) docker-push ARCH="$$arch"; \
	done
	$(MAKE) push-manifest

test: npm-test lint

npm-test:
	npm test

lint:
	npm run lint

