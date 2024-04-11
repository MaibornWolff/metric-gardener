#!/usr/bin/env node
import process from "node:process";
import { hideBin } from "yargs/helpers";
import { parser } from "./cli.js";

void parser.parse(hideBin(process.argv));
