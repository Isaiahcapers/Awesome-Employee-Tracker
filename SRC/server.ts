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

    static viewdepartments() {
        pool.query(
           `SELECT id, name FROM department;`,
           (err,res)=> { if (err) throw err; console.log(res.rows);} 
        );
    };       

    static viewroles(){
        pool.query(
            `SELECT title,id as role_id,salary,department_id FROM role;`,
            (err,res)=> { if (err) throw err; console.log(res.rows);} 
         );
    };

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
                this.viewdepartments();
            } else if (answers.ViewAddUpdate === 'view all roles') {
                this.viewroles();
            // } else if (answers.ViewAddUpdate === 'view all employees') {
            //     this.viewemployees();
            // } else if (answers.ViewAddUpdate === 'add a department') {
            //     this.adddepartment();
            // } else if (answers.ViewAddUpdate === 'add a role') {
            //     this.addrole();
            // }else if (answers.ViewAddUpdate === 'add an employee') {
            //     this.addemployee();
            // } else if (answers.ViewAddUpdate === 'update an employee role') {
            //     this.updateemployee();
             }
        });
    }
}
MenuCli.startCli();
export default MenuCli;