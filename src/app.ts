#!/usr/bin/env node
import { parser } from "./cli.js";
import { hideBin } from "yargs/helpers";

void parser.parse(hideBin(process.argv));
