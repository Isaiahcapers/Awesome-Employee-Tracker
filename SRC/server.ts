import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

class MenuCli {

    static async viewDepartments() {
        try {  
            const res = await pool.query(`SELECT id, name FROM department;`);
            console.log(res.rows);
            MenuCli.startCli();
            return res.rows;
        } catch (err) {
            throw err;
        }  
    };      

    static async viewroles(){
        try {
         const res = await pool.query(
            `SELECT title,id as role_id,salary,department_id FROM role;`,);   
            console.log(res.rows);
            MenuCli.startCli();
            return res.rows;          
        } catch (err) {
            throw err;
        }
        
    };

    static viewemployees() {
        pool.query(
            `SELECT employee.id as employee_id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department_name, manager.first_name as manager_first_name
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee as manager ON employee.manager_id = manager.id;`,
            (err,res)=> { if (err) throw err; console.log(res.rows);}
        )
    };

    static adddepartment() {
        inquirer 
        .prompt ([{
            type: 'input',
            name: 'addDepartment',
            message: 'What is the name of the department?'
        }])
        .then((answers) => {
        const deptName = answers.addDepartment;
    
        pool.query(`INSERT INTO department (name) VALUES ($1)`, [deptName],
        (err,res)=> { 
            if (err) {throw err;}
        console.log(res.rows);
         });
        });
    }   

    static addrole() {
        inquirer.prompt([{
            type: 'input',
            name:'AddRoleName',
            message:'What is the title of the role?'
        }])
        .then 
    }

    static startCli(): void {
        inquirer
        .prompt ([
            {
                type: 'list',
                name: 'ViewAddUpdate',
                message: 
                ' Would you like to view all departments, view all roles, view all employees, add a department, add a role, add an employee or update an employee role?',
                choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role'],
            },
        ])
        .then ((answers) => {
            if (answers.ViewAddUpdate === 'view all departments') {
                MenuCli.viewDepartments();
            } else if (answers.ViewAddUpdate === 'view all roles') {
                MenuCli.viewroles();
            } else if (answers.ViewAddUpdate === 'view all employees') {
                MenuCli.viewemployees();
            } else if (answers.ViewAddUpdate === 'add a department') {
                MenuCli.adddepartment();
            } else if (answers.ViewAddUpdate === 'add a role') {
                MenuCli.addrole();
            }else if (answers.ViewAddUpdate === 'add an employee') {
            //     MenuCli.addemployee();
            // } else if (answers.ViewAddUpdate === 'update an employee role') {
            //     MenuCli.updateemployee();
             }
        });
    }
}
MenuCli.startCli();
export default MenuCli;