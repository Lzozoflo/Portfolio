
.PHONY: all secrets creat compose down prune volumes rmi clean fclean re logs logst logs_last logs-% logs% 

SERVICES = \
# 	mysql \
# 	myadmin \
# 	gateway \
# 	front \
# 	auth \
# 	user_service \
# 	chatp_service \
# 	chatg_service \
# 	morpion \
# 	pong3d

all:	secrets creat compose

secrets:
	@mkdir -p ./conf/secrets
	openssl rand -hex 2 > ./conf/secrets/data_pswd
	openssl rand -hex 2 > ./conf/secrets/cle_pswd
	openssl rand -hex 2 > ./conf/secrets/cle_chat
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./conf/secrets/nginx.key -out ./conf/secrets/nginx.crt -subj "/CN=Florent-cretin.fr"

creat:
	mkdir -p vol/db/data
 	chown root:root vol/db/data
	chmod 755 vol/db/data
	chmod +x ./conf/myadmin/conf.sh
	chmod +x ./conf/db/conf.sh


# docker

compose:
	docker compose up -d

down:
	docker compose down -v

prune:
	docker system prune -af --volumes

volumes:
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	rm -rf vol

rmi:
	docker container rm -f $$(docker ps -aq) 2>/dev/null || true
	docker rmi -f $$(docker images -q) 2>/dev/null || true

clean:	down
	$(MAKE) prune
	$(MAKE) rmi

fclean: clean
	docker volume prune -f
	docker network prune -f
	rm -r ./conf/secrets
	$(MAKE) volumes

re: fclean all


# all logs
logs:
	docker compose logs -f

# all logs with time
logst:
	docker compose logs -f -t

# start logs after the cmd
logs_last:
	docker compose logs -f -t --tail 0

# logs name services
logs-%:
	docker compose logs -f $*

# logs nb of services on SERVICES
logs%:
	docker compose logs -f $(word $*, $(SERVICES))


