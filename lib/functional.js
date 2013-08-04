var each = function(obj, iterator, context) {
    for(var key in obj) {
        iterator.call(context, obj[key], key, obj);
    }
};

var find = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
        if( iterator.call(context, value, index, list )) {
            results.push(value);
            return true;
        }
    });
    return results;
};

var map = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
};
