import * as ContentlyJsonApi from './ContentlyJsonApi';

export default ContentlyJsonApi;

if (typeof module !== 'undefined') {
	module.exports = ContentlyJsonApi;
	module.exports.default = ContentlyJsonApi;
	module.exports.ContentlyJsonApi = ContentlyJsonApi;
}
