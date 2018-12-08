import { fetchSecretJson } from "../src/index";

describe("fetchSecretJson", () => {
  it("should be able to fetch Secret JSON", async () => {
    const secretJson = await fetchSecretJson();

    const expectedJson = {
      Name: "test",
      ARN:
        "arn:aws:secretsmanager:ap-northeast-1:xxxxxxxxxxxx:secret:test-1O5wUG",
      Versions: [
        {
          VersionId: "87b38f9f-5422-4e7f-8fa3-0857c0905b22",
          VersionStages: ["VERSION4"],
          LastAccessedDate: 1523059200.0,
          CreatedDate: 1523092955.717
        }
      ]
    };

    expect(secretJson).toEqual(expectedJson);
  });
});
