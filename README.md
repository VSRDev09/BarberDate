# Barber Date

Sistema fullstack de agendamento para uma barbearia, desenvolvido com foco em experiência moderna, organização operacional e gerenciamento eficiente da agenda semanal.

O projeto possui dois fluxos principais:

* Área do cliente
* Painel administrativo do barbeiro

---

## Visão Geral

O cliente pode realizar agendamentos sem criar conta, informando apenas nome e telefone.

O barbeiro possui um painel administrativo protegido por autenticação JWT, onde pode:

* Gerenciar horários da semana
* Liberar ou fechar a agenda
* Visualizar agendamentos
* Exportar relatórios em PDF

---

## Stack Utilizada

### Frontend

* React
* Vite
* TailwindCSS
* React Router
* Axios
* Lucide Icons

### Backend

* Java Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA / Hibernate
* PostgreSQL

### Infraestrutura

* Docker Compose
* Nginx
* PostgreSQL

---

## Funcionalidades

### Cliente

* Agendamento sem criação de conta
* Visualização da agenda semanal
* Escolha de serviço e horário
* Confirmação de agendamento
* Consulta de agendamentos realizados
* Cancelamento de reservas

### Barbeiro / Admin

* Login protegido com JWT
* Painel administrativo
* Controle da agenda semanal
* Configuração de horários por dia
* Liberação e bloqueio da agenda
* Exportação de agenda diária em PDF

---

## Regras de Negócio

* Não permite horários duplicados
* Não permite reservar horários indisponíveis
* Não permite reservar horários passados
* Horários só ficam disponíveis após liberação do barbeiro
* Slots ocupados deixam de aparecer como disponíveis
* Clientes visualizam apenas informações públicas da agenda
* Admin possui acesso completo aos detalhes dos agendamentos
* A agenda semanal é recriada automaticamente no início de cada semana

---

## Estrutura do Projeto

```text
.
├── backend
├── frontend
├── Database
├── docker-compose.yml
└── README.md
```

---

# Como Executar

## Usando Docker

### Pré-requisitos

* Docker
* Docker Compose

### Subir aplicação

Na raiz do projeto:

```bash
docker compose up --build
```

### Endereços

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8080/api
```

### Encerrar containers

```bash
docker compose down
```

Remover volumes:

```bash
docker compose down -v
```

---

## Execução Local

### Pré-requisitos

* Java 21+
* Maven 3.9+
* Node.js
* PostgreSQL

---

### Backend

```bash
cd backend
mvn spring-boot:run
```

API disponível em:

```text
http://localhost:8080/api
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em:

```text
http://localhost:5173
```

---

## Endpoints Principais

### Autenticação

```http
POST /api/auth/login
```

### Cliente

```http
GET    /api/client/agenda
GET    /api/client/appointments
POST   /api/client/appointments
POST   /api/client/appointments/{id}/cancel
```

### Admin

```http
GET    /api/admin/dashboard
GET    /api/admin/appointments/week
GET    /api/admin/appointments/day/{date}/pdf
GET    /api/admin/schedules/week
PUT    /api/admin/schedules/day
POST   /api/admin/schedules/release
```

---

## Exemplos de Payload

### Login

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Criar Agendamento

```json
{
  "name": "Joao Silva",
  "phone": "(11) 99999-9999",
  "serviceId": 1,
  "slotId": 12
}
```

---

## Banco de Dados

O projeto utiliza PostgreSQL com estrutura baseada nas entidades:

* admins
* services
* weekly_schedules
* available_time_slots
* appointments

O backend também possui seed automática para:

* usuário administrador
* catálogo inicial de serviços

---

## Interface

* Tema escuro premium
* Layout responsivo
* Calendário semanal moderno
* Feedback visual com toasts
* Modal de confirmação
* Sidebar administrativa
* Preview de PDF

---

## Build

### Frontend

```bash
npm run build
```

### Backend

```bash
mvn clean package
```

---

## Autor

Desenvolvido por VSRDev09.
