import { Contently } from './Contently';

export default Contently;
export { Contently };

if (typeof module !== 'undefined') {
	module.exports = Contently;
	module.exports.default = Contently;
	module.exports.Contently = Contently;
}
