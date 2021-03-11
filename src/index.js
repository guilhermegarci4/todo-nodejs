const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(userUsername => userUsername.username == username);

  if(!user) {
      return response.status(404).json({error: "User not found"})
  }

  request.user = user;

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

  users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    });

    return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todos);

  return response.status(201).json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  todos = user.todos;
  for (var idInTodo in todos) {
    if(todos[idInTodo].id === id) {
      todos[idInTodo].title = title;
      todos[idInTodo].deadline = deadline;

      return response.status(201).send();
    } else {
      return response.status(400).json({error: "todo not exists"});
    }
  }  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const { id } = request.params;

    todos = user.todos;
    for (var idInTodo in todos) {
      if(todos[idInTodo].id === id) {
        todos[idInTodo].done = true;        
        return response.status(201).send();
      } else {
        return response.status(400).json({error: "todo not exists"});
      }
    }  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const { id } = request.params;

    todos = user.todos;
    for (var idInTodo in todos) {
      if(todos[idInTodo].id === id) {
        todos.splice(0,1);
        return response.status(204).send();
      } else {
        return response.status(400).json({error: "todo not exists"});
      }
    } 
});

module.exports = app;