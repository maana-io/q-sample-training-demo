const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const faker = require('faker')

const fakeGeoCoordinate = () => ({
  lat: faker.fake('{{address.latitude}}'),
  long: faker.fake('{{address.longitude}}')
})

const fakeCity = () => ({
  name: faker.random.arrayElement([
    'Bellevue',
    'London',
    'Houston',
    'Abu Dhabi',
    'New York',
    'Seattle',
    'Boston',
    'Los Angeles',
    'San Fransico',
    'Chicago',
    'Paris',
    'Amsterdam',
    'Berlin',
    'Moscow',
    'New Delhi',
    'Mumbai',
    'Beijing'
  ]),
  location: fakeGeoCoordinate()
})

const fakeCondiments = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return faker.random.arrayElement([
      'Mustard',
      'Mayo',
      'Ketchup',
      'Lettuce',
      'Tomato',
      'Pickle',
      'Onion'
    ])
  })
}

const fakeCities = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return fakeCity()
  })
}

const fakeContent = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return faker.random.arrayElement([
      'Roast Beef',
      'Turkey',
      'Cheese',
      'Egg',
      'Smoked Salmon'
    ])
  })
}

const fakeBreadType = () => {
  return faker.random.arrayElement(['Sourdough', 'Bagel', 'Whole wheet'])
}

const fakeSandwichName = () => {
  return (
    faker.fake('{{commerce.productAdjective}}') +
    ' ' +
    faker.random.arrayElement(['Plain', 'Double Decker', 'Royal'])
  )
}

const fakeSandwich = () => {
  return {
    name: fakeSandwichName(),
    breadType: fakeBreadType(),
    content: fakeContent(1),
    condiments: fakeCondiments(3),
    thickness: Math.random() * 10
  }
}

const fakeSandwiches = quantity => {
  return Object.keys([...Object.keys([...Array(quantity)])]).map(x => {
    return fakeSandwich()
  })
}

const resolvers = {
  Query: {
    info() {
      return {
        name: 'Demo Wrapper',
        version: '0.0.1'
      }
    },
    getTopCitiesByEvent(parent, { capital }, info, context) {
      return fakeCities(10)
    },
    getTopCitiesByCost(parent, { capital }, info, context) {
      return fakeCities(10)
    },

    idealCityFromCitiesByEventAndCost(
      parent,
      { citiesByEvent, citiesByCost },
      info,
      context
    ) {
      return fakeCity()
    },
    capitalToIdealLaunchDate(parent, { capital }, info, context) {
      return faker.fake('{{date.future}}')
    },
    capitalToRequiredInventory(parent, { capital }, info, context) {
      return fakeSandwiches(30)
    },
    generateLaunchStrategy(
      parent,
      { idealCity, idealLaunchDate, requiredInventory },
      info,
      context
    ) {
      return {
        idealCity,
        idealLaunchDate,
        requiredInventory
      }
    }
  },
  Mutation: {
    info() {
      return {
        name: 'Demo wrapper',
        version: '0.0.1'
      }
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
      endpoint: 'https://maana-incubator.herokuapp.com/training-demo/dev', // the endpoint of the Prisma API
      debug: true // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    })
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'))
