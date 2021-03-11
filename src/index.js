const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userNameExists = users.find(userUsername => userUsername.username == username);

  if(!userNameExists) {
      return response.status(404).json({error: "User not found"})
  }

  request.user = userNameExists;

  return next();
}

//Routes
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some(
    (user) => user.username === username
  );

  if(usersAlreadyExists) {
    return response.status(400).json({error: "User already exists!" })
  }

  const user = {
      id: uuid(),
      name,
      username,
      todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  let todo = user.todos.find(todo => todo.id === id)
  if(!todo){
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  todo = Object.assign(todo, {
    title,
    deadline: new Date(deadline)
  })

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const { id } = request.params;

    let todo = user.todos.find(todo => todo.id === id)

    if(!todo){
      return response.status(404).json({
        error: 'Mensagem do erro'
      })
    }
  
    todo = Object.assign(todo, {
      done: true
    })
  
    return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send();
});

module.exports = app;