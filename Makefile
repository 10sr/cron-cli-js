.PHONY: check

check:
	./test/crontab.sh

docker-build-local:
	docker build -t local/node-crond .
