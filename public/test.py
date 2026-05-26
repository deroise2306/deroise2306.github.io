import base64
import hashlib
import hmac
import json
import urllib.parse


def hmac_digest(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()


def main():
    nonce = input("Nhap nonce tu /api/v4/challenge: ").strip()

    camera = "CAM07"
    frame = "184273"
    ts = "2026-05-19T22:41:06.742+07:00"

    method = "GET"
    path = "/api/v4/evidence/snapshot"

    date_header = "20260519T154106Z"
    date_stamp = "20260519"

    service_label = "kma4_evidence"
    request_label = "kma4_request"

    frame_sha256 = "e5519185b09d389b713bece711673016abf354fac41e5fa841b4b71bc3048322"
    static_secret = b"kma-nvr-v4::evidence::chain::4187::wal"

    canonical_query = urllib.parse.urlencode(
        sorted({
            "camera": camera,
            "frame": frame,
            "ts": ts,
        }.items()),
        quote_via=urllib.parse.quote,
        safe="-_.~",
    )

    body_sha256 = hashlib.sha256(b"").hexdigest()

    canonical_request = "\n".join([
        method,
        path,
        canonical_query,
        body_sha256,
        date_header,
    ])

    canonical_hash = hashlib.sha256(canonical_request.encode()).hexdigest()

    scope = f"{date_stamp}/{camera}/{service_label}/{request_label}"

    string_to_sign = "\n".join([
        "KMA4-HMAC-SHA256",
        date_header,
        scope,
        canonical_hash,
        nonce,
        frame_sha256,
    ])

    k1 = hmac_digest(b"KMA4" + static_secret, date_stamp)
    k2 = hmac_digest(k1, camera)
    k3 = hmac_digest(k2, service_label)
    k4 = hmac_digest(k3, request_label)

    proof = hmac.new(
        k4,
        string_to_sign.encode(),
        hashlib.sha256,
    ).hexdigest()

    authorization = "Basic " + base64.b64encode(
        b"operator:kma@cam07-184273"
    ).decode()

    output = {
        "camera": camera,
        "frame": frame,
        "ts": ts,
        "authorization": authorization,
        "x-kma-access-key": "KMAOP-CAM07",
        "x-kma-date": date_header,
        "x-kma-nonce": nonce,
        "x-kma-frame-sha256": frame_sha256,
        "x-kma-scope": scope,
        "x-kma-proof": proof,
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()