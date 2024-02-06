function formatPrice(price) {
    // return Number.parseInt(price / (10 ** 18));
    return price / (10 ** 18);
}

function trimName(name) {
    return name.replace(/[0-9]/g, '').trim();
}

module.exports = {
    formatPrice, trimName
}