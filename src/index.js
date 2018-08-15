const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const faker = require('faker')

const fakeCost = () => {
  return {
    currency: faker.random.arrayElement(['USD', 'EUR']),
    value: faker.fake('{{commerce.price}}')
  }
}
const fakeLocation = () => {
  return {
    id: faker.fake('{{random.uuid}}'),
    name: faker.fake('{{hacker.noun}}'),
    coordinates: {
      lat: faker.fake('{{address.latitude}}'),
      long: faker.fake('{{address.longitude}}')
    }
  }
}

const fakePart = () => ({
  id: faker.fake('{{random.uuid}}'),
  name: faker.fake('{{hacker.noun}}'),
  descriptor: faker.fake('{{random.uuid}}')
})

const fakeParts = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return fakePart()
  })
}

const fakeManufacturer = () => ({
  id: faker.fake('{{random.uuid}}'),
  name: faker.fake('{{hacker.noun}}'),
  location: fakeLocation()
})

const fakeManufacturers = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return fakeManufacturer()
  })
}

let seedParts = fakeParts(2)
const randomPart = () => {
  return faker.random.arrayElement(seedParts)
}
const randomParts = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return randomPart()
  })
}

const fakeOrder = () => ({
  id: faker.fake('{{random.uuid}}'),
  part: randomPart(),
  deliveryDate: new Date(),
  cost: fakeCost(),
  status: faker.random.arrayElement(['OPEN', 'PURCHASED', 'ON_ROUTE', 'CLOSE'])
})

const fakeOrders = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return fakeOrder()
  })
}
let seedOrders = fakeOrders(2)

const randomOrder = () => {
  return faker.random.arrayElement(seedOrders)
}

const randomOrders = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return randomOrder()
  })
}

let seedManufacturers = fakeManufacturers(2)
const randomManufacturer = () => {
  let manufacturer = faker.random.arrayElement(seedManufacturers)
  manufacturer.parts = randomParts(10)
  manufacturer.orders = randomOrders(10)
  return manufacturer
}

const randomManufacturers = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return randomManufacturer()
  })
}

const resolvers = {
  Query: {
    info() {
      return 'query'
    },

    partLocation(partInput) {
      return fakeLocation()
    },
    partCost(partInput) {
      return fakeCost()
    },
    availableManufactureres(partInput) {
      return randomManufacturers(2).map(m => {
        return {
          ...m,
          parts: m.parts.map(p => ({
            ...p,
            order: randomOrder(),
            manufacturer: m
          })),
          orders: m.orders.map(o => ({
            ...o,
            supplier: randomManufacturer()
          }))
        }
      })
    },
    bestManufacturer(partInput) {
      let m = randomManufacturer()
      m.orders = randomOrders(10).map(o => ({ ...o, supplier: m }))
      m.parts = randomParts(10).map(p => ({
        ...p,
        order: randomOrder(),
        manufacturer: m
      }))
      return m
    }
  },
  Mutation: {
    info() {
      return 'mutate'
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
      endpoint: 'https://maana-procurement.herokuapp.com/marketplace/dev', // the endpoint of the Prisma API
      debug: true // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    })
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'))
