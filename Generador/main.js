//Importar mysql2
import mysql from "mysql2/promise";

//Crear la conexion
const pool = mysql.createPool({
  host: "db",
  user: "stocks",
  password: "stocks",
  database: "stocks",
  port: 3306,
  connectionLimit: 10,
});

//Creacion de tablas y restricciones
const createDb = async () => {
  try {
    const con = await pool.getConnection();
    await con.query("DROP TABLE IF EXISTS users");
    await con.query("DROP TABLE IF EXISTS stock");
    await con.query("DROP TABLE IF EXISTS empresas");
    await con.query(
      "CREATE TABLE users (id bigint(20) UNSIGNED NOT NULL, name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, email varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, email_verified_at timestamp NULL DEFAULT NULL, password varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, remember_token varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL, created_at timestamp NULL DEFAULT NULL, updated_at timestamp NULL DEFAULT NULL)"
    );
    await con.query(
      "ALTER TABLE users ADD PRIMARY KEY (id), ADD UNIQUE KEY users_email_unique (email)"
    );
    await con.query(
      "ALTER TABLE users MODIFY id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6"
    );
    await con.query(
      "CREATE TABLE empresas (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255))"
    );
    await con.query(
      "CREATE TABLE stock (id INT AUTO_INCREMENT PRIMARY KEY, empresas_id INT, valor FLOAT, fecha DATETIME)"
    );
    await con.query(
      "ALTER TABLE stock ADD CONSTRAINT fk_stock FOREIGN KEY (empresas_id) REFERENCES empresas(id) ON DELETE CASCADE"
    );
    con.release();
  } catch (err) {
    console.log(err);
  }
  console.log("Database created");
};

//Funcion para insert de las empresas
const insertCompanies = async () => {
  await createDb();

  try {
    const con = await pool.getConnection();
    const companies = [
      "bbva",
      "santander",
      "repsol",
      "iberdrola",
      "inditex",
      "caixabank",
      "cellnex",
      "naturgy",
      "telefonica",
      "ferrovial",
    ];
    //Crear el string de valores
    let values = companies.map((name) => `('${name}')`).join(",");
    //Ejecutar el insert
    await con.query(`INSERT INTO empresas (nombre) VALUES ${values}`);
    con.release();
    return companies.length;
    //Mostrar errores
  } catch (err) {
    console.log(err);
  }
  console.log("Companies inserted");
};

//Funcion de generacion de valores aleatorios
const volatility = 0.02;

const f = (old_price) => {
  const rnd = Math.random() - 0.4982;
  const change_percent = 2 * volatility * rnd;
  const change_amount = old_price * change_percent;
  const new_price = old_price + change_amount;

  if (new_price < 0.01) return new_price + Math.abs(change_amount) * 2;
  else if (new_price > 1000) return new_price - Math.abs(change_amount) * 2;

  return new_price;
};

//Conseguir el numero de empresas
const getCompaniesCount = async () => {
  const con = await pool.getConnection();
  const [rows] = await con.query("SELECT COUNT(*) FROM empresas");
  con.release();
  return rows[0]["COUNT(*)"];
};

// //Funcion para generar el historico
let seed = 100;
const generateData = async () => {
  await insertCompanies();

  const con = await pool.getConnection();

  //Creamos dos fechas
  let currentDate = new Date();
  let lastYear = new Date();

  //Preparamos la sentencia sql
  const insertStock = `INSERT INTO stock (empresas_id, valor, fecha) VALUES ?`;
  const inserts = [];

  //Llamada a la funcion para conseguir el numero de empresas
  let count = await getCompaniesCount();

  //Hacemos un bucle para recorrer todas las empresas
  for (let j = 0; j < count; j++) {
    //Asignamos a lastYear un año menos que el currentDate
    lastYear.setMonth(currentDate.getMonth() - 12);
    //Generamos un dato nuevo hasta llegar a la fecha actual
    while (lastYear <= currentDate) {
      let empresas_id = j + 1;
      for (let i = 0; i < 1; i++) {
        seed = f(seed);
        //Formateamos la fecha
        let date = lastYear.toISOString().replace(/T/, " ").replace(/\..+/, "");
        //Insertamos los datos en el array
        inserts.push([empresas_id, seed, date]);
      }
      //Sumamos un dia
      empresas_id % 10 === 0 ? (empresas_id = 1) : empresas_id++;
      lastYear.setDate(lastYear.getDate() + 1);
    }
  }
  //Ejecutamos la query del insert con todos los datos guardados
  await con.query(insertStock, [inserts]);
  con.release();
  console.log("stock inserted");
};
//Ejecutamos la funcion
generateData();

//Funcion para generar un dato nuevo cada minuto
const generateNewData = async () => {
  const con = await pool.getConnection();
  let seed = 100;
  let currentDate = new Date();

  const insertStock = `INSERT INTO stock (empresas_id, valor, fecha) VALUES ?`;
  const inserts = [];
  let count = await getCompaniesCount();

  for (let j = 0; j < count; j++) {
    let empresas_id = j + 1;
    seed = f(seed);
    let date = currentDate.toISOString().replace(/T/, " ").replace(/\..+/, "");
    inserts.push([empresas_id, seed, date]);
  }

  await con.query(insertStock, [inserts]);
  con.release();
  console.log("New data inserted");
};

const generateDataEveryMinute = () => {
  setInterval(() => {
    generateNewData();
  }, 60 * 1000);
};

generateDataEveryMinute();
