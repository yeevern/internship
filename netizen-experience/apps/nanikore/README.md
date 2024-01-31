# NaniKore Development

## Prerequisites

Docker and docker-compose are required to run the development environment. Setup docker and docker-compose for your platform.

## Development Image Setup

If there is change in dependency, you need to rebuild the development image. Remove the existing image and rebuild it.

```bash
npx nx run dev-server:build-docker-1.0.0
```

## Development

```bash
nx run nanikore-website:dev
```

### Accessing the development environment

- NextJS server: [http://localhost:3000](http://localhost:3000)
