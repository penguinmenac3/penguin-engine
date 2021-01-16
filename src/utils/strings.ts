interface String {
    format(args: any): string;
    replaceAll(search: string, replace: string): string;
}

String.prototype.format = function(): string {
    var formatted = this;
    for(var [k, v] of arguments[0]) {
        formatted = formatted.replace("{" + k + "}", v);
    }
    return formatted as string;
}

String.prototype.replaceAll = function(search: string, replace: string): string {
    return this.split(search).join(replace);
}
