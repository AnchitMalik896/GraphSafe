export class PackageParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidPackageJsonError extends PackageParserError {
  constructor(message = 'package.json is not valid JSON') {
    super(message);
  }
}

export class EmptyManifestError extends PackageParserError {
  constructor(message = 'package.json manifest is empty') {
    super(message);
  }
}