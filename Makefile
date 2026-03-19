.PHONY: all dev prod down prune volumes rmi clean fclean re logs logst logs_last logs-%
include .env

# ─── Environnement ────────────────────────────────────────────────────────────

# Usage : make dev | make prod | ENV=prod make all
ENV ?= dev
 
# ─── Targets principales ──────────────────────────────────────────────────────
 
all:
	@$(MAKE) $(ENV)


dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

studio:
	npx prisma studio --port 5555 --browser none --url "$(DATABASE_URL)"

modeldb:
	docker exec -it backend npx prisma migrate dev --name nom_du_changement

prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# ─── Docker ───────────────────────────────────────────────────────────────────

down:
	docker compose down -v


prune:
	docker system prune -af --volumes


volumes:
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true


rmi:
	docker container rm -f $$(docker ps -aq) 2>/dev/null || true
	docker rmi -f $$(docker images -q) 2>/dev/null || true


clean: down
	$(MAKE) prune
	$(MAKE) rmi


fclean: clean
	docker volume prune -f
	docker network prune -f
	$(MAKE) volumes


re: fclean
	$(MAKE) $(ENV)


# ─── Logs ─────────────────────────────────────────────────────────────────────

# SERVICES = \
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


