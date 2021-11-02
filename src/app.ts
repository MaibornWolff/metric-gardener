import { McCabeComplexity } from "./metrics/McCabeComplexity";
import {Functions} from "./metrics/Functions";

const mcc = new McCabeComplexity();
const functions = new Functions();

const metrics: Metric[] = [mcc, functions];

for (const metric of metrics) {
    metric.calculate();
}
