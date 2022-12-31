const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

const initiateDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error : ${err.message}`);
    program.exit(1);
  }
};

initiateDbAndServer();

//API TO GET TODOS FROM TODO TABLE OF DATABASE
app.get("/todos/", async (request, response) => {
  const { priority = "%%", status = "%%", search_q = "%%" } = request.query;

  const getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%' AND status LIKE '${status}' AND priority LIKE '${priority}';
    `;
  const todosArray = await database.all(getTodosQuery);
  response.send(todosArray);
});

//API TO GET TODO BASED ON TODO_ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;
  const todoArray = await database.get(getTodoQuery);
  response.send(todoArray);
});

//API  TO ADD ROW IN TODO
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES (
             ${id},
            '${todo}',
            '${priority}',
            '${status}' 
        );
    `;
  const dbResponse = await database.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API TO UPDATE TODO ROWS
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "%%", priority = "%%", todo = "%%" } = request.body;
  const updateTodoQuery = `
            UPDATE todo
            SET 
              status = '${status}',
              priority = '${priority}',
              todo = '${todo}'
            WHERE id = ${todoId};
        `;
  const dbResponse = await database.run(updateTodoQuery);
  if (status != "%%" && priority === "%%" && todo === "%%") {
    response.send("Status Updated");
  } else if (priority != "%%" && status === "%%" && todo === "%%") {
    response.send("Priority Updated");
  } else {
    response.send("Todo Updated");
  }
});

//API TO DELETE A TODO
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM todo
        WHERE id = ${todoId};
    `;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
