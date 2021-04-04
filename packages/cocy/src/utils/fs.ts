// node 12 compat, fs/promises only works on 14+
import { promises } from 'fs';
export default promises;
