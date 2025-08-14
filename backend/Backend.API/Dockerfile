# Use the official .NET SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the project file and restore dependencies
COPY ./Backend.API/Backend.API.csproj /app/
RUN dotnet restore /app/Backend.API.csproj

# Copy the rest of the application files and build the application
COPY ./Backend.API/. /app/
RUN dotnet publish /app/Backend.API.csproj -c Release -o /app/out

# Use the official .NET runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Set the working directory inside the container
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app/out .

# Expose the port the application runs on
EXPOSE 80

# Set the entry point for the container
ENTRYPOINT ["dotnet", "/app/Backend.API.dll"]