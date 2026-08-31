# Use the same Bun release as development and CI
FROM oven/bun:1.4.0 AS base

# Set the working directory in the container
WORKDIR /app

# Copy the dependency manifest and its exact lockfile
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application (if necessary)
# Uncomment the next line if you have a build step
# RUN bun run build

# Expose the port the app runs on (adjust if needed)
ENV PORT=8080
EXPOSE 8080

# Command to run the application
CMD ["bun", "run", "start"]
