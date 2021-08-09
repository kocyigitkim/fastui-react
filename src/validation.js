import phone from "phone";

export class ValidationResult {
    /**
     * @param {Boolean} success
     * @param {String} message
     * @param {Object} result
     */
    constructor(success, message, result) {
        this.success = success;
        this.message = success ? "VALIDATION.SUCCESS" : message;
        this.result = result || null;
    }
}

export function getDefinedValidators() {
    const fastui = global.window.fastui;
    if (!fastui.validators) {
        fastui.validators = [];
    }
    return fastui.validators;
}

export function setValidator(name, definition, message) {
    const validators = getDefinedValidators();
    validators.push({ name, definition, message });
}

export function validate(value, type, args) {
    args = Array.isArray(args) ? args : [];

    const validators = getDefinedValidators();
    const definition = validators.filter(v => v.name === type)[0];
    if (definition) {
        const result = definition.definition(value, ...args);
        if (typeof result === "object") {
            return new ValidationResult(Boolean(result.success), definition.message, result);
        }
        else {
            return new ValidationResult(Boolean(result), definition.message, result);
        }
    }
    return new ValidationResult(true, "VALIDATION.SUCCESS");
}

export function validateMultiple(value, types, args, forAll = true) {
    args = Array.isArray(args) ? args : [];
    const validators = getDefinedValidators();
    const results = [];
    for (let i = 0; i < types.length; i++) {
        const definition = validators.filter(v => v.name === types[i])[0];
        if (definition) {
            const result = definition.definition(value, ...args);
            if (result && result.success) {
                results.push(new ValidationResult(true, definition.message, result));
            }
            else {
                results.push(new ValidationResult(Boolean(result), "VALIDATION.ERROR", result));
            }
        }
        else {
            results.push(new ValidationResult(true, "VALIDATION.SUCCESS"));
        }
    }
    if (forAll) {
        const allValid = results.every(r => r.success);
        return new ValidationResult(allValid, results.map(r => r.message).join("\n"));
    }
    return results;
}

export function initPredefinedValidators() {

    setValidator("email", value => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
            return true;
        }
        return false;
    }, "VALIDATION.EMAIL");

    setValidator("url", value => {
        if (/^(?:(?:ht|f)tp(?:s?):\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value)) {
            return { success: true, result: new URL(value) };
        }
        return false;
    }, "VALIDATION.URL");

    setValidator("phone", value => {
        var p = phone(value);
        return { success: p.isValid, result: p };
    }, "VALIDATION.PHONE");

    setValidator("number", (value, args) => {
        value = (value || "").toString();
        if (value.length === 0) return false;

        const isDecimal = !isNaN(value = parseFloat(value));
        if (!isDecimal) return false;

        args = args || {};
        if (typeof args.min === "number") {
            if (value < min) return false;
        }

        if (typeof args.max === "number") {
            if (value > max) return false;
        }

        if (typeof args.precision === "number") {
            if (Number(value).toFixed(args.precision) != value) return false;
        }

        return true;
    });

    setValidator("username", (value, args) => {
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return false;
        }
        return true;
    });

}