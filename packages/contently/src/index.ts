import { Contently } from './Contently';
import { ContentlyResult } from './ContentlyResult';

export default Contently;
export { Contently, ContentlyResult };

if (typeof module !== 'undefined') {
	module.exports = Contently;
	module.exports.default = Contently;
	module.exports.Contently = Contently;
	module.exports.ContentlyResult = ContentlyResult;
}
