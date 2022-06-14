const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  /* 
  [x] - É necessário antes ter completado o código que falta no middleware checkExistsUserAccount. 
  Para isso, você deve pegar o username do usuário no header da requisição, verificar se 
  esse usuário existe e então colocar esse usuário dentro da request antes de chamar a função next. 
  Caso o usuário não seja encontrado, você deve retornar uma resposta contendo status 404.
  */
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  /* 
    [x] - Você deve permitir que um usuário seja criado e retorne um JSON com o usuário criado.
    Também é necessário que você retorne a resposta com o código `201`.
    [x] - Antes de criar um usuário você deve validar se outro usuário com o mesmo username já existe. 
    Caso exista, retorne uma resposta com status 400 e um json.
  */
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  /*
    [x] - É necessário pegar o usuário que foi repassado para o request no middleware 
    checkExistsUserAccount e então retornar a lista todos.
  */
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  /* 
   [x] - na rota POST /todos é necessário pegar o usuário que foi repassado 
    para o request no middleware checkExistsUserAccount, pegar também o 
    title e o deadline do corpo da requisição e adicionar um novo todo 
    na lista todos que está no objeto do usuário.
  */
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
