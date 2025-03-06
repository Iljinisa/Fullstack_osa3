require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { connect, connection } = require('mongoose')

const PORT = process.env.PORT

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('post-data', (request) => JSON.stringify(request.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error =>
            next(error)
        )

})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(result => {

            response.status(204).end()
        })
        .catch(error => {
            next(error)
        })

})

const generateId = () => {
    const persons = Person.find({})
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => Number(n.id)))
        : 0
    return String(maxId + 1)
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body


    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    console.log(request.params)
    console.log(request.params.id)
    Person
        .findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
}
)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    console.log(error.message)
    if (error.name === 'CastError') {
        console.log('malformatted id')
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        console.log('Validation error')
        return response.status(400).json({ error: error.message })
    }
    next(error)
}


app.use(errorHandler)


const unknownEndpoint = (request, response, next) => {
    response.status(404).send({ error: 'unknown endpoint' })
    next()
}


app.use(unknownEndpoint)

