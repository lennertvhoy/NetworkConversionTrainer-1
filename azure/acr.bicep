param location string = resourceGroup().location
param acrName string
param sku string = 'Basic'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: acrName
  location: location
}

resource acr 'Microsoft.ContainerRegistry/registries@2021-09-01' = {
  name: acrName
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: true
  }
}

output acrLoginServer string = acr.properties.loginServer 