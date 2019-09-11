import { Contently } from './Contently';
import { ContentlyResult } from './ContentlyResult';
import { ContentlyPlugin } from './ContentlyPlugin';

export default Contently;
export { Contently, ContentlyResult, ContentlyPlugin };

if (typeof module !== 'undefined') {
	module.exports = Contently;
	module.exports.default = Contently;
	module.exports.Contently = Contently;
	module.exports.ContentlyResult = ContentlyResult;
	module.exports.ContentlyPlugin = ContentlyPlugin;
}
