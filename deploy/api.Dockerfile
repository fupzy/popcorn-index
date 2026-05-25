# syntax=docker/dockerfile:1.7
# Contexte de build : racine du repo
# docker build -f deploy/api.Dockerfile -t popcorn-index-api .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY PopcornIndex.slnx Directory.Packages.props Directory.Build.props global.json* ./
COPY src/ ./src/
COPY database/ ./database/
COPY testing/ ./testing/
COPY specs/ ./specs/

RUN dotnet restore src/PopcornIndex/PopcornIndex.csproj
RUN dotnet publish src/PopcornIndex/PopcornIndex.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    APPSETTINGS_FOLDER=/app \
    ENV_FILE=/app/.env.empty

RUN useradd -m -u 1000 app && touch /app/.env.empty && chown -R app:app /app
USER app

COPY --from=build --chown=app:app /app/publish ./

EXPOSE 8080
ENTRYPOINT ["dotnet", "PopcornIndex.dll"]
