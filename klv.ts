export interface KLVPacket {
  key: Uint8Array;
  length: number;
  value: Uint8Array;
}

export interface MISB0601Data {
  // Tag 1
  checksum?: number;
  // Tag 2
  timestamp?: number;
  // Tag 3
  missionId?: string;
  // Tag 4
  platformTailNumber?: string;
  // Tag 5
  platformHeadingAngle?: number;
  // Tag 6
  platformPitchAngle?: number;
  // Tag 7
  platformRollAngle?: number;
  // Tag 8
  platformTrueAirspeed?: number;
  // Tag 9
  platformIndicatedAirspeed?: number;
  // Tag 10
  platformDesignation?: string;
  // Tag 11
  imageSource?: string;
  // Tag 12
  imageCoordinateSystem?: string;
  // Tag 13
  sensorLatitude?: number;
  // Tag 14
  sensorLongitude?: number;
  // Tag 15
  sensorTrueAltitude?: number;
  // Tag 16
  sensorHorizontalFieldOfView?: number;
  // Tag 17
  sensorVerticalFieldOfView?: number;
  // Tag 18
  sensorRelativeAzimuth?: number;
  // Tag 19
  sensorRelativeElevation?: number;
  // Tag 20
  sensorRelativeRoll?: number;
  // Tag 21
  slantRange?: number;
  // Tag 22
  targetWidth?: number;
  // Tag 23
  frameCenterLatitude?: number;
  // Tag 24
  frameCenterLongitude?: number;
  // Tag 25
  frameCenterElevation?: number;
  // Tags 26–29 (offset corners)
  cornerLatitudePoint1?: number;
  cornerLongitudePoint1?: number;
  cornerLatitudePoint2?: number;
  cornerLongitudePoint2?: number;
  // Tags 30–33 (other corners)
  cornerLatitudePoint3?: number;
  cornerLongitudePoint3?: number;
  cornerLatitudePoint4?: number;
  cornerLongitudePoint4?: number;
  // Tag 34
  icingDetected?: number;
  // Tag 35
  windDirection?: number;
  // Tag 36
  windSpeed?: number;
  // Tag 37
  staticPressure?: number;
  // Tag 38
  densityAltitude?: number;
  // Tag 39
  outsideAirTemperature?: number;
  // Tag 40
  targetLocationLatitude?: number;
  // Tag 41
  targetLocationLongitude?: number;
  // Tag 42
  targetLocationElevation?: number;
  // Tag 43
  targetTrackGateWidth?: number;
  // Tag 44
  targetTrackGateHeight?: number;
  // Tag 45
  targetErrorEstimateCe90?: number;
  // Tag 46
  targetErrorEstimateLe90?: number;
  // Tag 47
  genericFlagData?: number;
  // Tag 48
  securityLocalMetadataSet?: any;
  // Tag 49
  differentialPressure?: number;
  // Tag 50
  platformAngleOfAttack?: number;
  // Tag 51
  platformVerticalSpeed?: number;
  // Tag 52
  platformSideslipAngle?: number;
  // Tag 53
  airfieldBarometricPressure?: number;
  // Tag 54
  airfieldElevation?: number;
  // Tag 55
  relativeHumidity?: number;
  // Tag 56
  platformGroundSpeed?: number;
  // Tag 57
  groundRange?: number;
  // Tag 58
  platformFuelRemaining?: number;
  // Tag 59
  platformCallSign?: string;
  // Tag 60
  weaponLoad?: number;
  // Tag 61
  weaponFired?: number;
  // Tag 62
  laserPrfCode?: number;
  // Tag 63
  sensorFieldOfViewName?: number;
  // Tag 64
  platformMagneticHeading?: number;
  // Tag 65
  uasLsVersionNumber?: number;
  // Tag 66
  targetLocationCovarianceMatrix?: any;
  // Tag 67
  alternatePlatformLatitude?: number;
  // Tag 68
  alternatePlatformLongitude?: number;
  // Tag 69
  alternatePlatformAltitude?: number;
  // Tag 70
  alternatePlatformName?: string;
  // Tag 71
  alternatePlatformHeading?: number;
  // Tag 72
  eventStartTimeUtc?: number;
  // Tag 73
  rvtLocalSet?: any;
  // Tag 74
  vmtiDataSet?: any;
  // Tag 75
  sensorHeightEllipsoid?: number;
  // Tag 76
  alternatePlatformEllipsoidHeight?: number;
  // Tag 77
  operationalMode?: number;
  // Tag 78
  frameCenterHeightAboveEllipsoid?: number;
  // Tag 79
  sensorNorthVelocity?: number;
  // Tag 80
  sensorEastVelocity?: number;
  // Tag 81
  imageHorizonPixelPack?: any;
  // Tags 82–85 (full-range corners)
  cornerLatitudePoint1Full?: number;
  cornerLongitudePoint1Full?: number;
  cornerLatitudePoint2Full?: number;
  cornerLongitudePoint2Full?: number;
  cornerLatitudePoint3Full?: number;
  cornerLongitudePoint3Full?: number;
  cornerLatitudePoint4Full?: number;
  cornerLongitudePoint4Full?: number;
  // Tags 90–93 (full-range angles)
  platformPitchAngleFull?: number;
  platformRollAngleFull?: number;
  platformAngleOfAttackFull?: number;
  platformSideslipAngleFull?: number;
  // Tag 94
  miisCoreIdentifier?: Uint8Array;
  // Tag 95
  sarMotionImageryMetadataSet?: any;

  /** Pour tout tag non prévu ci-dessus */
  [key: string]: any;
}

export default class MISB0601Parser {
  private static readonly MISB_0601_KEY = new Uint8Array([
    0x06, 0x0e, 0x2b, 0x34, 0x02, 0x0b, 0x01, 0x01, 0x0e, 0x01, 0x03, 0x01,
    0x01, 0x00, 0x00, 0x00,
  ]);

  static parseKLVPacket(data: Uint8Array): KLVPacket | null {
    if (data.length < 16) return null;
    const key = data.slice(0, 16);
    if (!this.isValidMISB0601Key(key)) return null;

    let offset = 16;
    const lenInfo = this.parseBERLength(data, offset);
    if (!lenInfo) return null;
    const { length, bytesUsed } = lenInfo;
    offset += bytesUsed;

    if (offset + length > data.length) return null;
    const value = data.slice(offset, offset + length);
    return { key, length, value };
  }

  private static isValidMISB0601Key(key: Uint8Array): boolean {
    for (let i = 0; i < 16; i++) {
      if (key[i] !== this.MISB_0601_KEY[i]) return false;
    }
    return true;
  }

  private static parseBERLength(
    data: Uint8Array,
    offset: number,
  ): { length: number; bytesUsed: number } | null {
    if (offset >= data.length) return null;
    const b0 = data[offset];
    if ((b0 & 0x80) === 0) {
      return { length: b0, bytesUsed: 1 };
    }
    const num = b0 & 0x7f;
    if (num === 0 || offset + num >= data.length) return null;
    let len = 0;
    for (let i = 1; i <= num; i++) {
      len = (len << 8) | data[offset + i];
    }
    return { length: len, bytesUsed: num + 1 };
  }

  static parseMISB0601(value: Uint8Array): MISB0601Data {
    const result: MISB0601Data = {};
    let offset = 0;

    while (offset < value.length) {
      const tagInfo = this.parseTag(value, offset);
      if (!tagInfo) break;
      const { tag, bytesUsed: tBytes } = tagInfo;
      offset += tBytes;

      const lenInfo = this.parseBERLength(value, offset);
      if (!lenInfo) break;
      const { length, bytesUsed: lBytes } = lenInfo;
      offset += lBytes;

      if (offset + length > value.length) break;
      const data = value.slice(offset, offset + length);
      offset += length;

      this.decodeValue(result, tag, data);
    }

    return result;
  }

  private static parseTag(
    data: Uint8Array,
    offset: number,
  ): { tag: number; bytesUsed: number } | null {
    if (offset >= data.length) return null;
    const byte = data[offset];
    return { tag: byte, bytesUsed: 1 };
  }

  private static decodeValue(
    result: MISB0601Data,
    tag: number,
    data: Uint8Array,
  ): void {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    switch (tag) {
      case 1:
        result.checksum = view.getUint16(0, false);
        break;
      case 2:
        result.timestamp = Number(view.getBigUint64(0, false));
        break;
      case 3:
        result.missionId = this.decodeString(data);
        break;
      case 4:
        result.platformTailNumber = this.decodeString(data);
        break;
      case 5:
        result.platformHeadingAngle = this.decodeAngle(data, 0, 360);
        break;
      case 6:
        result.platformPitchAngle = this.decodeAngle(data, -20, 20);
        break;
      case 7:
        result.platformRollAngle = this.decodeAngle(data, -50, 50);
        break;
      case 8:
        result.platformTrueAirspeed = this.decodeUint(data);
        break;
      case 9:
        result.platformIndicatedAirspeed = this.decodeUint(data);
        break;
      case 10:
        result.platformDesignation = this.decodeString(data);
        break;
      case 11:
        result.imageSource = this.decodeString(data);
        break;
      case 12:
        result.imageCoordinateSystem = this.decodeString(data);
        break;
      case 13:
        result.sensorLatitude = this.decodeCoordinate(data, true);
        break;
      case 14:
        result.sensorLongitude = this.decodeCoordinate(data, false);
        break;
      case 15:
        result.sensorTrueAltitude = this.decodeAltitude(data);
        break;
      case 16:
        result.sensorHorizontalFieldOfView = this.decodeAngle(data, 0, 180);
        break;
      case 17:
        result.sensorVerticalFieldOfView = this.decodeAngle(data, 0, 180);
        break;
      case 18:
        result.sensorRelativeAzimuth = this.decodeAngle(data, 0, 360);
        break;
      case 19:
        result.sensorRelativeElevation = this.decodeAngle(data, -180, 180);
        break;
      case 20:
        result.sensorRelativeRoll = this.decodeAngle(data, -180, 180);
        break;
      case 21:
        result.slantRange = this.decodeDistance(data, 5_000_000);
        break;
      case 22:
        result.targetWidth = this.decodeDistance(data, 10_000);
        break;
      case 23:
        result.frameCenterLatitude = this.decodeCoordinate(data, true);
        break;
      case 24:
        result.frameCenterLongitude = this.decodeCoordinate(data, false);
        break;
      case 25:
        result.frameCenterElevation = this.decodeAltitude(data);
        break;
      case 26:
        result.cornerLatitudePoint1 = this.decodeOffsetCorner(data, true);
        break;
      case 27:
        result.cornerLongitudePoint1 = this.decodeOffsetCorner(data, false);
        break;
      case 28:
        result.cornerLatitudePoint2 = this.decodeOffsetCorner(data, true);
        break;
      case 29:
        result.cornerLongitudePoint2 = this.decodeOffsetCorner(data, false);
        break;
      case 30:
        result.cornerLatitudePoint3 = this.decodeOffsetCorner(data, true);
        break;
      case 31:
        result.cornerLongitudePoint3 = this.decodeOffsetCorner(data, false);
        break;
      case 32:
        result.cornerLatitudePoint4 = this.decodeOffsetCorner(data, true);
        break;
      case 33:
        result.cornerLongitudePoint4 = this.decodeOffsetCorner(data, false);
        break;
      case 34:
        result.icingDetected = view.getUint8(0);
        break;
      case 35:
        result.windDirection = this.decodeAngle(data, 0, 360);
        break;
      case 36:
        result.windSpeed = this.decodeUint(data);
        break;
      case 37:
        result.staticPressure = this.decodeUint(data);
        break;
      case 38:
        result.densityAltitude = this.decodeAltitude(data);
        break;
      case 39:
        result.outsideAirTemperature = view.getInt8(0);
        break;
      case 40:
        result.targetLocationLatitude = this.decodeCoordinate(data, true);
        break;
      case 41:
        result.targetLocationLongitude = this.decodeCoordinate(data, false);
        break;
      case 42:
        result.targetLocationElevation = this.decodeAltitude(data);
        break;
      case 43:
        result.targetTrackGateWidth = view.getUint16(0, false);
        break;
      case 44:
        result.targetTrackGateHeight = view.getUint8(0);
        break;
      case 45:
        result.targetErrorEstimateCe90 = view.getUint16(0, false);
        break;
      case 46:
        result.targetErrorEstimateLe90 = view.getUint16(0, false);
        break;
      case 47:
        result.genericFlagData = view.getUint8(0);
        break;
      case 48:
        result.securityLocalMetadataSet = this.parseMISB0601(data);
        break;
      case 49:
        result.differentialPressure = this.decodeUint(data);
        break;
      case 50:
        result.platformAngleOfAttack = this.decodeAngle(data, -20, 20);
        break;
      case 51:
        result.platformVerticalSpeed = this.decodeAngle(data, -180, 180);
        break;
      case 52:
        result.platformSideslipAngle = this.decodeAngle(data, -20, 20);
        break;
      case 53:
        result.airfieldBarometricPressure = this.decodeUint(data);
        break;
      case 54:
        result.airfieldElevation = this.decodeAltitude(data);
        break;
      case 55:
        result.relativeHumidity = view.getUint8(0);
        break;
      case 56:
        result.platformGroundSpeed = this.decodeUint(data);
        break;
      case 57:
        result.groundRange = this.decodeDistance(data, 5_000_000);
        break;
      case 58:
        result.platformFuelRemaining = view.getUint16(0, false);
        break;
      case 59:
        result.platformCallSign = this.decodeString(data);
        break;
      case 60:
        result.weaponLoad = view.getUint16(0, false);
        break;
      case 61:
        result.weaponFired = view.getUint16(0, false);
        break;
      case 62:
        result.laserPrfCode = this.decodeUint(data);
        break;
      case 63:
        result.sensorFieldOfViewName = view.getUint8(0);
        break;
      case 64:
        result.platformMagneticHeading = this.decodeAngle(data, 0, 360);
        break;
      case 65:
        result.uasLsVersionNumber = view.getUint8(0);
        break;
      case 66:
        result.targetLocationCovarianceMatrix = Array.from(data);
        break;
      case 67:
        result.alternatePlatformLatitude = this.decodeCoordinate(data, true);
        break;
      case 68:
        result.alternatePlatformLongitude = this.decodeCoordinate(data, false);
        break;
      case 69:
        result.alternatePlatformAltitude = this.decodeAltitude(data);
        break;
      case 70:
        result.alternatePlatformName = this.decodeString(data);
        break;
      case 71:
        result.alternatePlatformHeading = this.decodeAngle(data, 0, 360);
        break;
      case 72:
        result.eventStartTimeUtc = Number(view.getBigUint64(0, false));
        break;
      case 73:
        result.rvtLocalSet = this.parseMISB0601(data);
        break;
      case 74:
        result.vmtiDataSet = this.parseMISB0601(data);
        break;
      case 75:
        result.sensorHeightEllipsoid = this.decodeAltitude(data);
        break;
      case 76:
        result.alternatePlatformEllipsoidHeight = this.decodeAltitude(data);
        break;
      case 77:
        result.operationalMode = view.getUint8(0);
        break;
      case 78:
        result.frameCenterHeightAboveEllipsoid = this.decodeAltitude(data);
        break;
      case 79:
        result.sensorNorthVelocity = view.getInt16(0, false);
        break;
      case 80:
        result.sensorEastVelocity = view.getInt16(0, false);
        break;
      case 81:
        result.imageHorizonPixelPack = Array.from(data);
        break;
      case 82:
        result.cornerLatitudePoint1Full = this.decodeCoordinate(data, true);
        break;
      case 83:
        result.cornerLongitudePoint1Full = this.decodeCoordinate(data, false);
        break;
      case 84:
        result.cornerLatitudePoint2Full = this.decodeCoordinate(data, true);
        break;
      case 85:
        result.cornerLongitudePoint2Full = this.decodeCoordinate(data, false);
        break;
      case 86:
        result.cornerLatitudePoint3Full = this.decodeCoordinate(data, true);
        break;
      case 87:
        result.cornerLongitudePoint3Full = this.decodeCoordinate(data, false);
        break;
      case 88:
        result.cornerLatitudePoint4Full = this.decodeCoordinate(data, true);
        break;
      case 89:
        result.cornerLongitudePoint4Full = this.decodeCoordinate(data, false);
        break;
      case 90:
        result.platformPitchAngleFull = view.getInt32(0, false);
        break;
      case 91:
        result.platformRollAngleFull = view.getInt32(0, false);
        break;
      case 92:
        result.platformAngleOfAttackFull = view.getInt32(0, false);
        break;
      case 93:
        result.platformSideslipAngleFull = view.getInt32(0, false);
        break;
      case 94:
        result.miisCoreIdentifier = data;
        break;
      case 95:
        result.sarMotionImageryMetadataSet = this.parseMISB0601(data);
        break;
      default:
        result[`tag_${tag}`] = Array.from(data)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
    }
  }

  private static decodeUint(data: Uint8Array): number {
    let raw = 0;
    for (const b of data) raw = (raw << 8) | b;
    return raw;
  }

  private static decodeOffsetCorner(data: Uint8Array, isLat: boolean): number {
    const raw = (data[0] << 8) | data[1];
    const signed = raw & 0x8000 ? raw - 0x10000 : raw;
    const range = isLat ? 0.075 : 0.075;
    return (signed / 0x7fff) * range;
  }

  private static decodeString(data: Uint8Array): string {
    // UTF-8 couvre ASCII/ISO-646
    return new TextDecoder('utf-8').decode(data).trim();
  }

  private static decodeAngle(
    data: Uint8Array,
    min: number,
    max: number,
  ): number | null {
    const len = data.length;
    let raw = 0;
    for (const b of data) raw = (raw << 8) | b;

    const bitLen = len * 8;
    const errorCode = 1 << (bitLen - 1);
    if (raw === errorCode) return null;

    const isSigned = min === -max;
    if (isSigned) {
      const signed = raw & errorCode ? raw - (1 << bitLen) : raw;
      const norm = signed / (Math.pow(2, bitLen - 1) - 1);
      return norm * max;
    } else {
      const maxRaw = Math.pow(256, len) - 1;
      const frac = raw / maxRaw;
      return min + frac * (max - min);
    }
  }

  private static decodeCoordinate(
    data: Uint8Array,
    isLatitude: boolean,
  ): number | null {
    let raw = 0;
    for (const b of data) raw = (raw << 8) | b;

    const errorCode = 0x80000000;
    if (raw === errorCode) return null;

    const signed = raw & errorCode ? raw - 0x100000000 : raw;

    const intRange = Math.pow(2, 32) - 2; // 0xFFFFFFFE
    const range = isLatitude ? 180 : 360;
    return (signed * range) / intRange;
  }

  private static decodeAltitude(data: Uint8Array): number {
    let raw = 0;
    for (const b of data) raw = (raw << 8) | b;
    const maxRaw = Math.pow(256, data.length) - 1;
    return -900 + (raw / maxRaw) * 19900;
  }

  private static decodeDistance(data: Uint8Array, maxRange: number): number {
    let raw = 0;
    for (const b of data) raw = (raw << 8) | b;
    const maxRaw = Math.pow(256, data.length) - 1;
    return (raw / maxRaw) * maxRange;
  }
}

/** convertit une chaîne hex en Uint8Array */
export const parseHexString = (hex: string): Uint8Array | null => {
  const cleaned = hex.replace(/\s+/g, '');
  if (cleaned.length % 2 !== 0) return null;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.substr(i, 2), 16);
    if (Number.isNaN(byte)) return null;
    bytes[i / 2] = byte;
  }
  return bytes;
};
