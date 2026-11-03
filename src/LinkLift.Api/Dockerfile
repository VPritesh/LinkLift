FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/LinkLift.Api/LinkLift.Api.csproj", "src/LinkLift.Api/"]
COPY ["src/LinkLift.Application/LinkLift.Application.csproj", "src/LinkLift.Application/"]
COPY ["src/LinkLift.Domain/LinkLift.Domain.csproj", "src/LinkLift.Domain/"]
COPY ["src/LinkLift.Infrastructure/LinkLift.Infrastructure.csproj", "src/LinkLift.Infrastructure/"]
RUN dotnet restore "src/LinkLift.Api/LinkLift.Api.csproj"
COPY . .
WORKDIR "/src/src/LinkLift.Api"
RUN dotnet build "LinkLift.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LinkLift.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LinkLift.Api.dll"]

