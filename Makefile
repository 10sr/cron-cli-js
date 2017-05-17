.PHONY: check

check:
	true

docker-build-local:
	docker build -t local/node-crond .
